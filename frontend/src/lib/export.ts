import { API_URL } from "@/lib/api";
import { useUi } from "@/store/ui";

function filename(kind: "pdf" | "excel", period: string) {
  return `KNT-Hisobot-${period}.${kind === "excel" ? "xlsx" : "pdf"}`;
}

async function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function exportReport(kind: "pdf" | "excel", period = "monthly", locale = "tg") {
  const token = localStorage.getItem("oems_token") || "";
  const res = await fetch(`${API_URL}/export/${kind}?period=${period}&lang=${locale}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || type.includes("text/html") || type.includes("application/json")) {
    throw new Error("export");
  }
  const blob = await res.blob();
  if (blob.size < 80) throw new Error("export");
  const name = filename(kind, period);

  if (kind === "pdf") {
    const blobUrl = URL.createObjectURL(blob);
    useUi.getState().setPdf(blobUrl, name);
    return blobUrl;
  }

  const file = new File([blob], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
      return;
    }
  } catch {
    /* user cancelled share — still download */
  }
  await triggerDownload(blob, name);
}

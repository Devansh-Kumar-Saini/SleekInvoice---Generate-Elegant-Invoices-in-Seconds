export async function downloadCSV(invoiceId: string) {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/csv`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to generate CSV");
    }

    // Get the blob from response
    const blob = await response.blob();

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "invoice.csv";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    throw error;
  }
}

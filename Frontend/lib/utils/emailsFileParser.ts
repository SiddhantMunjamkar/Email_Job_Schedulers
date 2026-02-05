export async function extractEmailsFromFile(file: File): Promise<string[]> {
  const text = await file.text();
  const emails = Array.from(
    new Set(
      text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
    ),
  );

  return emails;

   
}

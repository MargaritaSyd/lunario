import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function shareJson(filename: string, json: string): Promise<void> {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: filename,
    UTI: 'public.json',
  });
}

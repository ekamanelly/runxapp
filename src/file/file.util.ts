export function getFileContentType(fileName: string): string | null {
  const arr = fileName.split('.');
  if (!arr.length) {
    return null;
  }
  const extension = arr[arr.length - 1];
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'mp3':
      return 'audio/mpeg';
    case 'mp4':
      return 'video/mp4';
    default:
      return null;
  }
}

export function getAzureContainerName(extension: string): string | null {
  switch (extension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image';
    case 'pdf':
      return 'doc';
    case 'mp3':
      return 'audio';
    case 'mp4':
      return 'video';
    default:
      return null;
  }
}

export function getFileExtention(fileName: string) {
  const splt = fileName.split('.');
  return splt[splt.length - 1];
}

export function getFormattedFileName(str) {
  // Remove spaces from string using regular expression
  const formattedString = str.replace(/\s+/g, '-');
  // Convert string to lowercase
  const lowercaseString = formattedString.toLowerCase();
  // Generate UUID
  const uuid = generateUUID();
  // Add UUID and dash to beginning of string
  const finalString = uuid + '-' + lowercaseString;
  return finalString;
}

function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
  return uuid;
}

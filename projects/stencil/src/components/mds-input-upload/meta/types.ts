const LOCALSTORAGE_KEY_USER_SORT = 'mds-inpu-ulpload-user-sort'

enum Status {
  UPLOADING,
  ERROR,
  ABORT,
  SUCCESS
}

enum ErrorType {
  SIZE,
  TYPE,
  MAX,
}

type AttachmentSort =
  'status' |
  'date'

interface FileStatus {
  key: string,
  file: File,
  status: Status,
  errorMessage?: string,
  errorType?: ErrorType,
  id: number,
}

interface FileError {
  filename: string,
  errorMessage: string,
}

export {
  LOCALSTORAGE_KEY_USER_SORT,

  AttachmentSort,
  Status,
  FileStatus,
  ErrorType,
  FileError,
}

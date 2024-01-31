const LOCALSTORAGE_KEY_USER_SORT = 'mds-inpu-ulpload-user-sort'

enum Status {
  UPLOADING,
  ERROR,
  ABORT,
  SUCCESS
}

enum AttachmentSort {
  status = 'status',
  date = 'date',
}
interface FileStatus {
  key: string,
  file: File,
  status: Status,
  errorMessage?: string
  id: number
}


export {
  LOCALSTORAGE_KEY_USER_SORT,

  AttachmentSort,
  Status,
  FileStatus,
}

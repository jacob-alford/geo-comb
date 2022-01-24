import * as FS from 'fs'
import * as Path from 'path'
import * as TE from 'fp-ts/TaskEither'

/**
 *  Writes a file to the specified filename
 */
export const writeFile: (
  fileName: string,
  data: string | DataView,
) => TE.TaskEither<NodeJS.ErrnoException, void> = (fileName, data) =>
  TE.tryCatchK(
    () =>
      new Promise<void>((resolve, reject) =>
        FS.writeFile(Path.join(__dirname, fileName), data, 'utf8', e =>
          e !== null ? reject(e) : resolve(),
        ),
      ),
    e => e as NodeJS.ErrnoException,
  )()

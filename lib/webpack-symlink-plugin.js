// Fork of https://github.com/nystudio107/create-symlink-webpack-plugin
// license https://github.com/nystudio107/create-symlink-webpack-plugin/blob/8e71a584b343afa764374053fc4a2b53f4aa4835/LICENSE.md

const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp").sync

function tryCatch(fn, log = false) {
  try {
    fn()
  } catch (err) {
    if (log) {
      console.error(err)
    }
  }
}

module.exports = class CreateSymlinkPlugin {
  constructor(options, force = false) {
    if (options instanceof Array) {
      this.options = options
    } else {
      this.options = [options]
    }
    this.force = force
    this.folders = new Set()
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync(
      {
        name: "CreateSymlinkPlugin",
        context: true
      },
      (context, compilation, callback) => {
        const makeSymlinks = option => {
          const { origin, symlink } = option
          const reportProgress = context && context.reportProgress
          const force =
            typeof option.force == "boolean" ? option.force : this.force

          if (fs.existsSync(origin) || force) {
            if (force) {
              tryCatch(() => {
                fs.unlinkSync(symlink)
              })
            } else {
              tryCatch(() => {
                fs.unlinkSync(symlink)
              })
            }

            const dirname = path.dirname(symlink)
            if (!this.folders.has(dirname)) {
              if (!fs.existsSync(dirname)) {
                tryCatch(() => {
                  mkdirp(dirname)
                }, true)
                this.folder.add(dirname)
              }
            }

            const baseDir = process.cwd()
            process.chdir(path.dirname(symlink))

            tryCatch(() => {
              fs.symlinkSync(
                path.relative(process.cwd(), path.join(baseDir, origin)),
                path.basename(symlink)
              )
            }, true)

            if (reportProgress) {
              reportProgress(
                100.0,
                "Created symlink from: ",
                origin,
                " to: ",
                symlink
              )
            }

            process.chdir(baseDir)
          }
        }

        this.options.forEach(makeSymlinks)
        callback()
      }
    )
  }
}

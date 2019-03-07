const path = require("path")
const CreateSymlinkPlugin = require("./lib/webpack-symlink-plugin")
const glob = require("fast-glob").sync
const withMDX = require("@zeit/next-mdx")({
  extension: /\.mdx?$/
})

const extensions = ["md", "mdx"]
const pageExtensions = extensions.map(ext => `${ext}.symlink`)

module.exports = (nextConfig = {}) => {
  return withMDX(
    Object.assign({ pageExtensions }, nextConfig, {
      webpack(config, options) {
        const posts = glob(["./posts/*.mdx"]).map((post, i) => {
          let slug = post.replace("posts/", "pages/")

          if (typeof nextConfig.slug === "function") {
            // TODO: get posts meta and create posts index.
            // const meta = getPostMeta(post)
            const index = Math.round(i % 2)
            const meta = {
              title: path
                .basename(post)
                .split(".")
                .slice(0, -1)
                .join("."),
              date: `${["2018", "2019"][index]}/${["05", "02"][index]}/10`
            }

            slug = "./pages/" + nextConfig.slug(meta) + ".mdx"
          }

          return {
            origin: post,
            symlink: slug + ".symlink"
          }
        })

        /*
          TODO:

          EXPORT A MAP OF
          { originalPostPath: destPostPath }

          and export and create a Link component that wraps next/link
          so linking still works.

          Then in webpack `next/link` could be aliased to this wrapper.
        */

        config.plugins.push(new CreateSymlinkPlugin(posts))

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options)
        }

        return config
      }
    })
  )
}

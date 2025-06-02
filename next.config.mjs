/** @type {import('next').NextConfig} */

import nextra from "nextra";

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
  contentDirBasePath: "/books",
});

export default withNextra({
  reactStrictMode: true,
  output: "standalone",
});
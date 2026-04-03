import {
	defineConfig,
	defineDocs,
	frontmatterSchema,
} from "fumadocs-mdx/config"
import { z } from "zod"

import { transformers } from "@/lib/highlight-code"

export const docs = defineDocs({
	dir: "content/docs",
	docs: {
		schema: frontmatterSchema.extend({
			wide: z.boolean().default(false),
			updated: z.date().optional(),
			flag: z.string().optional(),
		}),
	},
})

export default defineConfig({
	mdxOptions: {
		rehypeCodeOptions: {
			themes: {
				light: "github-light",
				dark: "github-dark",
			},
			transformers,
		},
	},
})

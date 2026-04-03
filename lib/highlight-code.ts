import type { ShikiTransformer } from "shiki"

export const transformers: ShikiTransformer[] = [
	{
		name: "fumadocs:remove-escape",
		code(node) {
			if (node.tagName === "code") {
				const textNode = node.children[0]
				if (textNode && textNode.type === "text") {
					textNode.value = textNode.value.replace(/\[\\!code/g, "[!code")
				}
			}
		},
	},
	{
		name: "package-manager-transformer",
		code(node) {
			if (node.tagName === "code") {
				const raw = this.source
				node.properties["__raw__"] = raw

				if (raw.startsWith("npm install")) {
					node.properties["__npm__"] = raw
					node.properties["__yarn__"] = raw.replace("npm install", "yarn add")
					node.properties["__pnpm__"] = raw.replace("npm install", "pnpm add")
					node.properties["__bun__"] = raw.replace("npm install", "bun add")
				}

				if (raw.startsWith("npm create")) {
					node.properties["__npm__"] = raw
					node.properties["__yarn__"] = raw.replace("npm create", "yarn create")
					node.properties["__pnpm__"] = raw.replace("npm create", "pnpm create")
					node.properties["__bun__"] = raw.replace("npm create", "bun create")
				}

				if (raw.startsWith("npx create-")) {
					const command = raw.replace("npx create-", "")
					node.properties["__npm__"] = raw
					node.properties["__yarn__"] = `yarn create ${command}`
					node.properties["__pnpm__"] = `pnpm create ${command}`
					node.properties["__bun__"] = `bunx create-${command}`
				}

				if (raw.startsWith("npx") && !raw.startsWith("npx create-")) {
					const command = raw.replace("npx ", "")
					node.properties["__npm__"] = raw
					node.properties["__yarn__"] = `yarn dlx ${command}`
					node.properties["__pnpm__"] = `pnpm dlx ${command}`
					node.properties["__bun__"] = raw.replace("npx", "bunx")
				}

				if (raw.startsWith("npm run")) {
					node.properties["__npm__"] = raw
					node.properties["__yarn__"] = raw.replace("npm run", "yarn")
					node.properties["__pnpm__"] = raw.replace("npm run", "pnpm")
					node.properties["__bun__"] = raw.replace("npm run", "bun run")
				}
			}
		},
	},
	{
		name: "add-metadata",
		pre(node) {
			node.properties["data-code-block"] = ""
		},
		code(node) {
			if (node.tagName === "code") {
				node.properties["data-line-numbers"] = ""
				node.properties["data-lang"] = this.options.lang ?? "plaintext"
			}
		},
		line(node) {
			if (node.tagName === "span") {
				node.properties["data-line"] = ""
			}
		},
	},
]

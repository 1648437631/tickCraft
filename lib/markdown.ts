import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^\p{L}\p{N}\u4e00-\u9fff-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function rehypeCodeblockFrame() {
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;
      if (node.tagName !== "pre") return;

      const header = {
        type: "element",
        tagName: "div",
        properties: { className: ["codeblock__header"] },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["codeblock__traffic"] },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: { className: ["codeblock__dot", "codeblock__dot--red"] },
                children: [],
              },
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["codeblock__dot", "codeblock__dot--yellow"],
                },
                children: [],
              },
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["codeblock__dot", "codeblock__dot--green"],
                },
                children: [],
              },
            ],
          },
          {
            type: "element",
            tagName: "button",
            properties: {
              type: "button",
              className: ["codeblock__copy"],
            },
            children: [{ type: "text", value: "复制" }],
          },
        ],
      };

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["codeblock"] },
        children: [header, node],
      };
    });
  };
}

export async function renderMarkdown(markdown: string) {
  const toc: TocItem[] = [];

  const file = await remark()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => {
      return (tree: unknown) => {
        visit(tree, "heading", (node: any) => {
          if (node.depth !== 2 && node.depth !== 3) return;
          const text = (node.children ?? [])
            .filter((c: any) => c.type === "text" || c.type === "inlineCode")
            .map((c: any) => c.value)
            .join("")
            .trim();
          if (!text) return;
          const id = slugifyHeading(text);

          toc.push({ id, text, level: node.depth });

          node.data = node.data ?? {};
          node.data.hProperties = {
            ...(node.data.hProperties ?? {}),
            id,
          };
        });
      };
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(rehypeCodeblockFrame)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return { html: String(file), toc };
}

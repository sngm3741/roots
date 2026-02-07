import ReactMarkdown from "react-markdown";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  content: string;
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypePrism]}
        components={{
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="my-6 w-full rounded-2xl border border-slate-200 object-cover dark:border-slate-800"
            />
          ),
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline decoration-blue-200 underline-offset-2 dark:text-blue-300"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

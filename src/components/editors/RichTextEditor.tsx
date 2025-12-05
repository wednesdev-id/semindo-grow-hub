import { useMemo, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write your content here...',
    className = ''
}: RichTextEditorProps) {
    const quillRef = useRef<ReactQuill>(null);

    // Suppress findDOMNode deprecation warning (known issue with react-quill in React 18)
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            if (
                typeof args[0] === 'string' &&
                args[0].includes('findDOMNode')
            ) {
                return;
            }
            originalError.call(console, ...args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'code-block'],
            ['clean']
        ],
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'align',
        'link', 'image', 'code-block'
    ];

    return (
        <div className={`rich-text-editor ${className}`}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-background"
            />
            <style>{`
                .rich-text-editor .ql-container {
                    min-height: 300px;
                    font-size: 14px;
                }
                
                .rich-text-editor .ql-editor {
                    min-height: 300px;
                }
                
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-color: hsl(var(--muted));
                    border-color: hsl(var(--border));
                }
                
                .rich-text-editor .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    border-color: hsl(var(--border));
                }
                
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: hsl(var(--muted-foreground));
                    font-style: normal;
                }
            `}</style>
        </div>
    );
}

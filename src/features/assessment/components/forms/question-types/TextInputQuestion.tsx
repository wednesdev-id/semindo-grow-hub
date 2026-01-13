interface TextInputQuestionProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    multiline?: boolean
    maxLength?: number
}

export default function TextInputQuestion({
    value,
    onChange,
    placeholder = 'Ketik jawaban Anda...',
    multiline = false,
    maxLength
}: TextInputQuestionProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value)
    }

    const commonClasses = `w-full rounded-lg border-2 border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary`

    return (
        <div className="space-y-2">
            {multiline ? (
                <textarea
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    rows={5}
                    className={commonClasses + ' resize-none'}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={commonClasses}
                />
            )}

            {/* Character Counter */}
            {maxLength && (
                <div className="flex justify-end">
                    <span className={`text-xs ${value.length > maxLength * 0.9
                            ? 'text-danger'
                            : 'text-body-color dark:text-dark-6'
                        }`}>
                        {value.length} / {maxLength}
                    </span>
                </div>
            )}
        </div>
    )
}

interface ProgressBarProps {
    progress?: number;
    label?: string;
}

export default function ProgressBar({ progress = 0, label }: ProgressBarProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between text-xs mb-1 font-medium text-gray-600 dark:text-gray-300">
                    <span>{label}</span>
                    <span>{clampedProgress}%</span>
                </div>
            )}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
        </div>
    );
}
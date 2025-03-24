import { memo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type SearchBarProps = {
    value: string
    onChange: (value: string) => void
}

export const SearchBar = memo(({ value, onChange }: SearchBarProps) => (
    <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
        <Input
            placeholder="Search messages..."
            className="pl-9 h-10 bg-muted/50 border-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
));
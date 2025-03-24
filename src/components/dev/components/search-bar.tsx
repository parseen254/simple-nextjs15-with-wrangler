import { memo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type SearchBarProps = {
    value: string
    onChange: (value: string) => void
}

export const SearchBar = memo(({ value, onChange }: SearchBarProps) => (
    <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
            placeholder="Search messages..."
            className="pl-8"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
));
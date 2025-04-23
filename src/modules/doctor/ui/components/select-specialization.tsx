"use client";
import { trpc } from "@/app/trpc/client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectSpecializationProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}
export const SelectSpecialization = ({ value, onChange, className }: SelectSpecializationProps) => {
    const data = trpc.doctorType.getDoctorTypes.useSuspenseQuery();
    const professions = data[0];
    console.log(data);
    return <Select>
        <SelectTrigger className={cn("w-full", className)}>
            <SelectValue placeholder="Select a Profession" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {professions?.map((professions) => (
                    <SelectItem
                        key={professions.id}
                        onClick={() => onChange(professions.name)}
                        value={professions.name}
                    >
                        {professions.name}
                    </SelectItem>
                ))}
            </SelectGroup>
        </SelectContent>
    </Select>
};
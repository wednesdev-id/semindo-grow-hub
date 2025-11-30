export interface UMKMProfileDto {
    businessName: string
    ownerName: string
    address: string
    city: string
    province: string
    postalCode?: string
    phone: string
    email: string
    website?: string
    description?: string
    sector: string
    yearEstablished?: number
    employeeCount?: number
    annualRevenue?: number
    assetsValue?: number
    legalEntity?: string // PT, CV, etc.
    nib?: string
}

export interface MentorProfileDto {
    fullName: string
    expertise: string[]
    experienceYears: number
    bio?: string
    linkedinUrl?: string
    availability?: string
    hourlyRate?: number
}

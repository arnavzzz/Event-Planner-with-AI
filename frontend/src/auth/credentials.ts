export type Role = "event-organizer" | "vendor" | "admin"

export interface Account {
    email : string;
    password: string;
    role: Role;
    label: string;
}

export const ROLES: {role: Role; label: string} [] = [
    {role: "event-organizer", label: "Event Organizer"},
    {role: "vendor", label: "Vendor"},
    {role: "admin", label: "Admin"},
]

export const DEMO_ACCOUNTS: Account[] = [
    {
        email: "eo1@arnav.com",
        password: "123456",
        role:"event-organizer",
        label: "Event Organizer",
    },
    {
        email: "ve1@arnav.com",
        password: "654321",
        role: "vendor",
        label: "Vendor",
    },
    {
        email: "ad1@arnav.com",
        password: "135246",
        role: "admin",
        label: "Admin"
    },
]

export function validateCredentials
    (email: string, password:string):Role|null {
        const match = DEMO_ACCOUNTS.find(
            (account) =>
                account.email.toLowerCase() === email.trim().toLowerCase()
                && account.password === password

        );

        return match ? match.role :null;
}
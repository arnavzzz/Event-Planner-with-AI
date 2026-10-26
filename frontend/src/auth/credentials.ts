export type Role = "event-organizer"

export interface Account {
    email : string;
    password: string;
    role: Role;
    label: string;
}

export const DEMO_ACCOUNTS: Account[] = [
    {
        email: "eo1@arnav.com",
        password: "123456",
        role:"event-organizer",
        label: "Event Organizer",
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

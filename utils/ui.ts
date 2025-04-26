// Format date

const monthNames: string[] = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const formatDate = (date: Date): string => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toFixed(2)}`;
};

const currentDate: Date = new Date();
export const currentMonth: string = monthNames[currentDate.getMonth()];
export const currentYear: number = currentDate.getFullYear();
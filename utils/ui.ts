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

export const getNiceFractionalStep = (range: number, numberOfStep: number) => {
    const roughStep = range / numberOfStep;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalizedStep = roughStep / magnitude;

    // Choose nice fractional values
    let niceFraction;
    if (normalizedStep <= 1) niceFraction = 1;
    else if (normalizedStep <= 2) niceFraction = 2;
    else if (normalizedStep <= 2.5) niceFraction = 2.5;
    else if (normalizedStep <= 5) niceFraction = 5;
    else niceFraction = 10;

    return niceFraction * magnitude;
};

export const formatMonthYear = (monthYearString: string): string => {
    // Month mapping
    const monthMap: { [key: string]: string } = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    // Split the string by space
    const parts = monthYearString.trim().split(' ');

    if (parts.length !== 2) {
        throw new Error('Invalid format. Expected format: "Apr 2025"');
    }

    const monthAbbr = parts[0];
    const year = parts[1];

    // Get month number
    const monthNumber = monthMap[monthAbbr];

    if (!monthNumber) {
        throw new Error(`Invalid month abbreviation: ${monthAbbr}`);
    }

    return `${year}/${monthNumber}`;
};

const currentDate: Date = new Date();
export const currentMonth: string = monthNames[currentDate.getMonth()];
export const currentYear: number = currentDate.getFullYear();
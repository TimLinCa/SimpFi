import TextRecognition from '@react-native-ml-kit/text-recognition';

// Types for receipt data
export interface ReceiptItem {
    item_name: string;
    item_value: string;
    item_quantity?: string;
}

export interface ParsedReceipt {
    total: string;
    time: string;
    store_name: string;
    items: ReceiptItem[];
}

export interface OCRResult {
    text: string;
    confidence?: number;
}

// Enhanced receipt parsing utility with TypeScript
export class ReceiptParser {
    /**
     * Main method to parse OCR text into structured receipt data
     */
    static parseReceipt(ocrText: string): ParsedReceipt {
        const lines: string[] = ocrText
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);

        return {
            total: this.extractTotal(lines),
            time: this.extractDate(lines),
            store_name: this.extractStoreName(lines),
            items: this.extractItems(lines)
        };
    }

    /**
     * Extract store name from receipt lines
     */
    static extractStoreName(lines: string[]): string {
        // Common store patterns
        const storePatterns: RegExp[] = [
            /^(.*superstore.*|.*walmart.*|.*target.*|.*costco.*|.*sobeys.*|.*metro.*|.*loblaws.*)$/i,
            /^[A-Z][A-Z\s&'-]{5,}$/,  // All caps store names
            /^[A-Z\s&'-]{10,}$/  // Long uppercase names
        ];

        // Check first 5 lines for store name
        for (const line of lines.slice(0, 5)) {
            for (const pattern of storePatterns) {
                if (pattern.test(line)) {
                    return line.toUpperCase().trim();
                }
            }
        }

        // Fallback to first line if no pattern matches
        return lines[0]?.toUpperCase().trim() || '';
    }

    /**
     * Extract date from receipt lines
     */
    static extractDate(lines: string[]): string {
        const datePatterns: RegExp[] = [
            /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,  // YYYY-MM-DD or YYYY/MM/DD
            /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/,  // MM-DD-YYYY or MM/DD/YYYY
            /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2})/,  // MM-DD-YY or MM/DD/YY
            /date[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,  // Date: MM/DD/YYYY
        ];

        for (const line of lines) {
            for (const pattern of datePatterns) {
                const match: RegExpMatchArray | null = line.match(pattern);
                if (match && match[1]) {
                    return this.standardizeDate(match[1]);
                }
            }
        }

        // Default to current date if not found
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Standardize date format to YYYY-MM-DD
     */
    static standardizeDate(dateString: string): string {
        const parts: string[] = dateString.split(/[-\/]/);

        if (parts.length !== 3) return dateString;

        let year: string, month: string, day: string;

        // Determine format based on year position
        if (parts[0].length === 4) {
            // YYYY-MM-DD
            [year, month, day] = parts;
        } else if (parts[2].length === 4) {
            // MM-DD-YYYY or DD-MM-YYYY
            [month, day, year] = parts;
        } else {
            // MM-DD-YY or DD-MM-YY
            [month, day, year] = parts;
            year = `20${year}`;
        }

        // Ensure proper padding
        month = month.padStart(2, '0');
        day = day.padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    /**
     * Extract total amount from receipt lines
     */
    static extractTotal(lines: string[]): string {
        const totalPatterns: RegExp[] = [
            /total[:\s]*\$?(\d+\.?\d*)/i,
            /^total\s+(\d+\.?\d*)$/i,
            /\btotal\b.*?(\d+\.\d{2})/i,
            /(\d+\.\d{2})\s*$/, // Last line with decimal amount
            /balance[:\s]*\$?(\d+\.?\d*)/i,
        ];

        // Check lines in reverse order (total usually at bottom)
        for (let i = lines.length - 1; i >= 0; i--) {
            const line: string = lines[i];
            for (const pattern of totalPatterns) {
                const match: RegExpMatchArray | null = line.match(pattern);
                if (match && match[1]) {
                    const amount = parseFloat(match[1]);
                    // Validate that it's a reasonable total amount and not NaN
                    if (!isNaN(amount) && amount > 0 && amount < 10000) {
                        return match[1];
                    }
                }
            }
        }

        return '';
    }

    /**
     * Extract items from receipt lines
     */
    static extractItems(lines: string[]): ReceiptItem[] {
        const items: ReceiptItem[] = [];
        const excludePatterns: RegExp[] = [
            /^(subtotal|total|tax|gst|hst|pst|qst)/i,
            /^(thank you|store|date|time|cashier)/i,
            /^(receipt|customer|phone|address)/i,
            /^\d{1,4}$/,  // Just numbers
            /^[a-z]{1,3}$/i,  // Short abbreviations
            /^[-=*_]+$/,  // Separator lines
            /card.*ending/i,
            /receipt/i,
            /^\s*$/,
            /^(visa|mastercard|debit|credit)/i,
            /^(change|tendered)/i,
        ];

        for (const line of lines) {
            // Skip excluded patterns
            if (excludePatterns.some((pattern: RegExp) => pattern.test(line))) {
                continue;
            }

            const item: ReceiptItem | null = this.parseItemLine(line);
            if (item) {
                items.push(item);
            }
        }

        return items;
    }

    /**
     * Parse individual item line
     */
    static parseItemLine(line: string): ReceiptItem | null {
        // Clean the line
        const cleanLine: string = line.replace(/\s+/g, ' ').trim();

        // Pattern 1: ITEM NAME QTY @ PRICE TOTAL
        const qtyAtPattern: RegExp = /^(.+?)\s+(\d+)\s*@\s*(\d+\.?\d*)\s+(\d+\.?\d*)$/;
        let match: RegExpMatchArray | null = cleanLine.match(qtyAtPattern);
        if (match) {
            return {
                item_name: match[1].trim(),
                item_quantity: match[2],
                item_value: match[4]
            };
        }

        // Pattern 2: ITEM NAME QTY x PRICE TOTAL
        const qtyXPattern: RegExp = /^(.+?)\s+(\d+)\s*x\s*(\d+\.?\d*)\s+(\d+\.?\d*)$/;
        match = cleanLine.match(qtyXPattern);
        if (match) {
            return {
                item_name: match[1].trim(),
                item_quantity: match[2],
                item_value: match[4]
            };
        }

        // Pattern 3: QTY ITEM NAME PRICE
        const qtyFirstPattern: RegExp = /^(\d+)\s+(.+?)\s+(\d+\.?\d*)$/;
        match = cleanLine.match(qtyFirstPattern);
        if (match && match[2].length > 3) {
            const price = parseFloat(match[3]);
            if (!isNaN(price) && price > 0) {
                return {
                    item_name: match[2].trim(),
                    item_quantity: match[1],
                    item_value: match[3]
                };
            }
        }

        // Pattern 4: ITEM NAME PRICE (simple)
        const simplePattern: RegExp = /^(.+?)\s+(\d+\.?\d*)$/;
        match = cleanLine.match(simplePattern);
        if (match && match[1].length > 3) {
            const price = parseFloat(match[2]);
            const itemName = match[1].trim();

            // Additional validation
            if (!isNaN(price) && price > 0 && price < 1000 && itemName.length >= 3) {
                // Check if item name contains mostly letters
                const letterCount = (itemName.match(/[a-zA-Z]/g) || []).length;
                if (letterCount >= itemName.length * 0.5) {
                    return {
                        item_name: itemName,
                        item_value: match[2]
                    };
                }
            }
        }

        return null;
    }

    /**
     * Clean up common OCR errors
     */
    static cleanOCRText(text: string): string {
        return text
            .replace(/[Il1|]/g, '1') // Common OCR mistakes for numbers
            .replace(/[O0]/g, '0')
            .replace(/[S5]/g, '5')
            .replace(/\s+/g, ' ') // Multiple spaces to single
            .trim();
    }

    /**
     * Validate parsed receipt data
     */
    static validateReceipt(receipt: ParsedReceipt): boolean {
        // Check if we have minimum required data
        const totalValue = parseFloat(receipt.total);
        const hasTotal = receipt.total != "" && !isNaN(totalValue) && totalValue > 0;
        const hasStoreName = receipt.store_name != "" && receipt.store_name.trim().length > 0;
        const hasItems = receipt.items && receipt.items.length > 0;

        return hasTotal && hasStoreName && hasItems;
    }

    /**
     * Calculate total from items (for validation)
     */
    static calculateItemsTotal(items: ReceiptItem[]): number {
        return items.reduce((total: number, item: ReceiptItem) => {
            const itemValue = parseFloat(item.item_value);
            const validValue = !isNaN(itemValue) ? itemValue : 0;
            return total + validValue;
        }, 0);
    }
}

/**
 * Main function to process receipt OCR
 */
export const processReceiptOCR = async (
    imageUri: string,
    ocrFunction: (uri: string) => Promise<OCRResult>
): Promise<ParsedReceipt> => {
    try {
        // Perform OCR
        const ocrResult: OCRResult = await ocrFunction(imageUri);

        // Clean the text
        const cleanedText: string = ReceiptParser.cleanOCRText(ocrResult.text);

        // Parse the receipt
        const parsedData: ParsedReceipt = ReceiptParser.parseReceipt(cleanedText);

        // Validate the result
        if (!ReceiptParser.validateReceipt(parsedData)) {
            throw new Error('Invalid receipt data parsed');
        }

        return parsedData;
    } catch (error: unknown) {
        console.error('Receipt processing error:', error);
        if (error instanceof Error) {
            throw new Error(`Receipt processing failed: ${error.message}`);
        }
        throw new Error('Receipt processing failed: Unknown error');
    }
};

/**
 * Utility function to format currency
 */
export const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
    }).format(num);
};

/**
 * Utility function to validate item data
 */
export const validateItem = (item: ReceiptItem): boolean => {
    const hasName = item.item_name != "" && item.item_name.trim().length > 0;

    const itemValue = parseFloat(item.item_value);
    const hasValidValue = item.item_value != "" && !isNaN(itemValue) && itemValue > 0;

    const quantityValue = item.item_quantity ? parseInt(item.item_quantity, 10) : null;
    const hasValidQuantity = !item.item_quantity ||
        (quantityValue !== null && !isNaN(quantityValue) && quantityValue > 0);

    return hasName && hasValidValue && hasValidQuantity;
};

export const performMLKitOCR = async (imageUri: string): Promise<OCRResult> => {
    try {
        const result = await TextRecognition.recognize(imageUri);
        console.log('ML Kit OCR result:', result);
        return {
            text: result.text,
            confidence: 0.9
        };
    } catch (error) {
        throw new Error(`ML Kit OCR failed: ${error}`);
    }
}
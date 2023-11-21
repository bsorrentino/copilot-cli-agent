export declare class ZodSchemaGenerator {
    #private;
    private verbose;
    constructor(verbose?: boolean);
    create(input: string): Promise<string>;
    update(input: string): Promise<string>;
}
export declare const generateZodSchema: () => ZodSchemaGenerator;

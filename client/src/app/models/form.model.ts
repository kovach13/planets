import { FormArray, FormControl, FormGroup } from "@angular/forms";
//typed form based on interface
export type TypedForm<T> = FormGroup<{
    [K in keyof T]: T[K] extends object
        ? T[K] extends Date
            ? FormControl<T[K] | null>
            : T[K] extends unknown[]
                ? FormArray<TypedForm<T[K] extends (infer V)[] ? V : T[K]>>
                : TypedForm<T[K]>
        : FormControl<T[K] | null>;
}>;
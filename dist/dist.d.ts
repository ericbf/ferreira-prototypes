declare type Comparator<T> = (element: T, index: number, array: T[]) => boolean;
declare type CompareFromArray<T> = (fromArray: T, item: T, index: number, array: T[]) => boolean;
declare type Sorter<T> = (rhs: T, lhs: T) => number;
declare type Accessor<T> = (item: T) => any;
declare type SortOptions<T> = {
    property?: string;
    accessor?: Accessor<T>;
    descending?: boolean;
    sorter?: Sorter<T>;
};
interface Array<T> {
    remove(comp: Comparator<T>, thisArg?: any): T | undefined;
    removeItem(item: T, thisArg?: any): T | undefined;
    find(comp: Comparator<T>, thisArg?: any): T | undefined;
    findIndex(comp: Comparator<T>, thisArg?: any): number | -1;
    first: T | undefined;
    last: T | undefined;
    sortBy(...propsOrOptionses: (string | SortOptions<T>)[]): T[];
    contains(comp: Comparator<T>, thisArg?: any): boolean;
    containsItem(item: T, thisArg?: any): boolean;
}
declare type MemoizeOptions = {
    excludedArguments?: number[];
    argumentsCount?: number;
    asynchronous?: boolean;
};
declare type MemoizeCache = {
    [key: string]: MemoizeCache | any;
    value?: any;
};
interface Function {
    curry(...args: any[]): any;
    memoize<T extends Function>(this: T, options?: MemoizeOptions): T;
    throttle<T extends Function>(this: T, wait?: number, immediate?: boolean): T;
    debounce<T extends Function>(this: T, wait?: number, immediate?: boolean): T;
}
declare type TopAndLeft = {
    top?: number;
    left?: number;
};
interface HTMLElement {
    readonly inDOM: boolean;
    readonly highestParent: HTMLElement | undefined;
    readonly isScrollable: boolean;
    readonly scrollableParent: HTMLElement | undefined;
    parentTop: number;
    absoluteTop: number;
    totalOffsetTop: number;
    parentLeft: number;
    absoluteLeft: number;
    totalOffsetLeft: number;
    animateScrollTo(topOrOptions: number | TopAndLeft, duration?: number, timing?: string): void;
    scrollIntoViewIfNeeded(duration?: number, padding?: number, timing?: string): void;
}
declare type Watcher = (newValue: any, oldValue: any, property: string) => void;
interface Object {
    merge<T extends Object>(this: T, ...others: T[]): T;
    override<T extends Object>(this: T, func: string, newFunc: Function): T;
    setWatcher<T extends Object>(this: T, property: string, didSet?: Watcher, willSet?: Watcher): T;
    addWatcher<T extends Object>(this: T, property: string, didSet?: Watcher, willSet?: Watcher): T;
    removeWatcher<T extends Object>(this: T, property?: string, didSet?: Watcher, willSet?: Watcher): T;
    getNestedProperty(...properties: string[]): any;
    valuesArray: any[];
}
interface String {
    contains(str: string, caseInsensitve?: boolean): boolean;
    toTitleCase(): string;
    toSnakeCase(): string;
    toCamelCase(): string;
    toRegExpEscaped(): string;
}

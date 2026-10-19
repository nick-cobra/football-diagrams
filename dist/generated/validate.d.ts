export function validateFormat1(data: any, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors }?: {
    instancePath?: string | undefined;
    rootData?: any;
    dynamicAnchors?: {} | undefined;
}): boolean;
export namespace validateFormat1 {
    namespace evaluated {
        let props: boolean;
        let dynamicProps: boolean;
        let dynamicItems: boolean;
    }
}
export function validateFormat2(data: any, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors }?: {
    instancePath?: string | undefined;
    rootData?: any;
    dynamicAnchors?: {} | undefined;
}): boolean;
export namespace validateFormat2 {
    export namespace evaluated_1 {
        let props_1: boolean;
        export { props_1 as props };
        let dynamicProps_1: boolean;
        export { dynamicProps_1 as dynamicProps };
        let dynamicItems_1: boolean;
        export { dynamicItems_1 as dynamicItems };
    }
    export { evaluated_1 as evaluated };
}

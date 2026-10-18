declare function validator_default(data: any, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors }?: {
    instancePath?: string | undefined;
    rootData?: any;
    dynamicAnchors?: {} | undefined;
}): boolean;
declare namespace validator_default {
    namespace evaluated {
        let props: boolean;
        let dynamicProps: boolean;
        let dynamicItems: boolean;
    }
}
export function validate(data: any, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors }?: {
    instancePath?: string | undefined;
    rootData?: any;
    dynamicAnchors?: {} | undefined;
}): boolean;
export namespace validate { }
export { validator_default as default };

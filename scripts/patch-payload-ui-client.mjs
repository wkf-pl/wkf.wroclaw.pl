// Patches Payload's pre-bundled clipboard helpers without adding imports or module-level overrides.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const clientBundlePath = resolve('node_modules/@payloadcms/ui/dist/exports/client/index.js')

const clipboardValidationReplacement = `function h2({data:t,path:e,...o}){if(typeof t>"u"||!e||!o.type)return!1;if(o.type==="blocks"){let n=o.blocks;if(typeof o.rowIndex==="number"){let r=\`${'${e}.${o.rowIndex}'}\`,s=t[\`${'${r}.blockType'}\`]?.value??t[r]?.value,i=typeof s==="string"?o.blocks.find(l=>l.slug===s):void 0;if(!i)return!1;n=[i]}return i9({blocksFromClipboard:n,blocksFromConfig:o.schemaBlocks})}return u1({fieldsFromClipboard:o.fields,fieldsFromConfig:o.schemaFields})}`

const clipboardMergeReplacement = `function ul({dataFromClipboard:t,formState:e,path:o,rowIndex:n}){let{type:r,data:s,path:i,rowIndex:l}=t,a=typeof l!="number",c=typeof n!="number",u=!a&&c,d=r==="array",f=Array.isArray(e[o]?.rows)?e[o].rows:[],m=f.length,p=typeof l==="number"&&Array.isArray(e[i]?.rows)?e[i].rows[l]:void 0,h;a&&c?h=i:a?h=\`${'${i}.${n}'}\`:h=\`${'${i}.${l}'}\`;let g;c?u?g=\`${'${o}.${m}'}\`:g=o:g=\`${'${o}.${n}'}\`;if(u){let C=s[\`${'${h}.id'}\`]?.value,y=s[\`${'${h}.blockType'}\`]?.value??s[h]?.value,v={id:C,isLoading:!1,lastRenderedPath:g};p?.customComponents?.RowLabel&&(v.customComponents={RowLabel:p.customComponents.RowLabel}),!d&&typeof y==="string"&&(v.blockType=y),e[o].rows=[...f,v],e[o].value=e[o].rows.length,e[o].disableFormData=!0}let b=new Map;for(let C in s){if(!c&&C===\`${'${h}.id'}\`||!Sf(C,h))continue;let y=C.replace(h,g),v=d?e[y]?.customComponents:void 0,w=d?e[y]?.validate:void 0;if(C.endsWith(".id")&&s[C]?.value!=null){let S=new T2().toHexString();b.set(C,S),e[y]={customComponents:v,validate:w,...s[C],initialValue:S,value:S};continue}e[y]={customComponents:v,validate:w,...s[C]}}for(let[C,y]of b){let v=C.replace(\`${'${h}.'}\`,"").split(".");if(v.length>=2){let w=Number.parseInt(v[v.length-2],10),S=v.slice(0,v.length-2).join("."),x=S?\`${'${g}.${S}'}\`:g;if(e[x]&&Array.isArray(e[x].rows)){let F=e[x].rows;!Number.isNaN(w)&&F[w]&&(F[w].id=y)}}else if(v.length===1&&v[0]==="id"){let w=g.split("."),S=w[w.length-1],x=Number.parseInt(S,10),F=Number.isNaN(x)?0:x,T=Number.isNaN(x)?g:w.slice(0,-1).join(".");if(e[T]&&Array.isArray(e[T].rows)){let D=e[T].rows;D[F]&&(D[F].id=y)}}}return e}`

const originalClientBundle = readFileSync(clientBundlePath, 'utf8')
let clientBundle = originalClientBundle
clientBundle = replaceBundleSegment({
  alreadyPatchedMarker: 'let n=o.blocks;if(typeof o.rowIndex==="number")',
  endMarker: 'function u1(',
  expectedOriginalMarkers: [
    'o.type==="blocks"?i9({blocksFromClipboard:o.blocks,blocksFromConfig:o.schemaBlocks})',
  ],
  replacement: clipboardValidationReplacement,
  source: clientBundle,
  startMarker: 'function h2(',
})
clientBundle = replaceBundleSegment({
  alreadyPatchedMarker: 'f=Array.isArray(e[o]?.rows)?e[o].rows:[]',
  endMarker: 'import{c as U9}',
  expectedOriginalMarkers: [
    'u=!a&&c,d=r==="array",f;',
    'e[o].initialValue=1',
    'typeof y=="string"&&T2.isValid(y)',
  ],
  replacement: clipboardMergeReplacement,
  source: clientBundle,
  startMarker: 'function ul(',
})

if (clientBundle !== originalClientBundle) {
  writeFileSync(clientBundlePath, clientBundle)
}

function replaceBundleSegment({
  alreadyPatchedMarker,
  endMarker,
  expectedOriginalMarkers,
  replacement,
  source,
  startMarker,
}) {
  const startIndex = source.indexOf(startMarker)
  const endIndex = source.indexOf(endMarker, startIndex)

  if (startIndex < 0 || endIndex < 0 || source.indexOf(startMarker, startIndex + 1) >= 0) {
    throw new Error(`Cannot locate the unique Payload bundle segment starting with ${startMarker}`)
  }

  const currentSegment = source.slice(startIndex, endIndex)
  if (currentSegment.includes(alreadyPatchedMarker)) {
    return source
  }

  for (const expectedMarker of expectedOriginalMarkers) {
    if (!currentSegment.includes(expectedMarker)) {
      throw new Error(
        `Payload bundle segment ${startMarker} no longer matches version 3.90.2; missing ${expectedMarker}`,
      )
    }
  }

  return source.slice(0, startIndex) + replacement + source.slice(endIndex)
}

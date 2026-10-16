// Patches Payload's pre-bundled clipboard helpers without adding imports or module-level overrides.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const clientBundlePath = resolve('node_modules/@payloadcms/ui/dist/exports/client/index.js')

const clipboardValidationReplacement = `function h2({data:t,path:e,...o}){if(typeof t>"u"||!e||!o.type)return!1;if(o.type==="blocks"){let n=o.blocks;if(typeof o.rowIndex==="number"){let r=\`${'${e}.${o.rowIndex}'}\`,s=t[\`${'${r}.blockType'}\`]?.value??t[r]?.value,i=typeof s==="string"?o.blocks.find(l=>l.slug===s):void 0;if(!i)return!1;n=[i]}return i9({blocksFromClipboard:n,blocksFromConfig:o.schemaBlocks})}return u1({fieldsFromClipboard:o.fields,fieldsFromConfig:o.schemaFields})}`

const clipboardPasteOriginal = `function il({onPaste:t,path:e,t:o,...n}){let r;try{let i=localStorage.getItem(g2);if(!i)return o("error:invalidClipboardData");r=JSON.parse(i)}catch{return o("error:invalidClipboardData")}let s={...r,...n,fieldPath:e};return h2(s)?(t(r),!0):o("error:invalidClipboardData")}`
const clipboardPasteReplacement = `function il({onPaste:t,path:e,t:o,...n}){let r;try{let i=localStorage.getItem(g2);if(!i)return o("error:invalidClipboardData");r=JSON.parse(i)}catch{return o("error:invalidClipboardData")}let s={...r,...n,fieldPath:e};if(!h2(s))return o("error:invalidClipboardData");if(t(r),r.cut===!0)try{localStorage.setItem(g2,JSON.stringify({...r,cut:!1}))}catch{try{localStorage.removeItem(g2)}catch{}}return!0}`

const clipboardMergeReplacement = `function wkfRemoveClipboardRow(t,e,o){let n={},r=[];for(let[s,i]of Object.entries(t)){if(s.indexOf(\`${'${e}.'}\`)!==0){n[s]=i;continue}let[l]=s.replace(\`${'${e}.'}\`,"").split(".");r[l]||(r[l]={});let a=s.replace(\`${'${e}.${String(l)}.'}\`,"");r[l][a]={...i}}r.splice(o,1);let s=[...(t[e]?.rows||[])];s.splice(o,1);let i={};return r.forEach((l,a)=>{for(let[c,u]of Object.entries(l))i[\`${'${e}.${a}.${c}'}\`]={...u}}),{...n,[e]:{...t[e],disableFormData:r.length>0,rows:s,value:r.length},...i}}function ul({dataFromClipboard:t,formState:e,path:o,rowIndex:n}){let{type:r,data:s,path:i,rowIndex:l}=t,a=typeof l!="number",c=typeof n!="number",u=!a&&c,d=r==="array",f=Array.isArray(e[o]?.rows)?e[o].rows:[],m=f.length,q=typeof l==="number"?s[\`${'${i}.${l}.id'}\`]?.value:void 0,z=Array.isArray(e[i]?.rows)?e[i].rows:[],A=q==null?-1:z.findIndex(K=>K?.id===q),p=A>=0?z[A]:typeof l==="number"?z[l]:void 0,h;a&&c?h=i:a?h=\`${'${i}.${n}'}\`:h=\`${'${i}.${l}'}\`;let g;c?u?g=\`${'${o}.${m}'}\`:g=o:g=\`${'${o}.${n}'}\`;if(u){let C=s[\`${'${h}.id'}\`]?.value,y=s[\`${'${h}.blockType'}\`]?.value??s[h]?.value,v={id:C,isLoading:!1,lastRenderedPath:g};p?.customComponents?.RowLabel&&(v.customComponents={RowLabel:p.customComponents.RowLabel}),!d&&typeof y==="string"&&(v.blockType=y),e[o].rows=[...f,v],e[o].value=e[o].rows.length,e[o].disableFormData=!0}let b=new Map;for(let C in s){if(!c&&C===\`${'${h}.id'}\`||!Sf(C,h))continue;let y=C.replace(h,g),v=d?e[y]?.customComponents:void 0,w=d?e[y]?.validate:void 0;if(C.endsWith(".id")&&s[C]?.value!=null){let S=new T2().toHexString();b.set(C,S),e[y]={customComponents:v,validate:w,...s[C],initialValue:S,value:S};continue}e[y]={customComponents:v,validate:w,...s[C]}}for(let[C,y]of b){let v=C.replace(\`${'${h}.'}\`,"").split(".");if(v.length>=2){let w=Number.parseInt(v[v.length-2],10),S=v.slice(0,v.length-2).join("."),x=S?\`${'${g}.${S}'}\`:g;if(e[x]&&Array.isArray(e[x].rows)){let F=e[x].rows;!Number.isNaN(w)&&F[w]&&(F[w].id=y)}}else if(v.length===1&&v[0]==="id"){let w=g.split("."),S=w[w.length-1],x=Number.parseInt(S,10),F=Number.isNaN(x)?0:x,T=Number.isNaN(x)?g:w.slice(0,-1).join(".");if(e[T]&&Array.isArray(e[T].rows)){let D=e[T].rows;D[F]&&(D[F].id=y)}}}let N=A>=0?\`${'${i}.${A}'}\`:void 0,O=!c&&o===i&&n===A,P=N?Sf(o,N):!1;return t.cut===!0&&A>=0&&!O&&!P?wkfRemoveClipboardRow(e,i,A):e}`

const scissorsIconElement = `Ir("svg",{className:"icon icon--scissors",fill:"none",height:20,viewBox:"0 0 20 20",width:20,xmlns:"http://www.w3.org/2000/svg",children:Ir("path",{d:"M5.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.3 7.3 17 17M7.3 12.7 17 3",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.4})})`
const cutIconOriginal = `children:[Ir(Bi,{}),"Wytnij wiersz"]`
const cutIconReplacement = `children:[${scissorsIconElement},"Wytnij wiersz"]`

const addRowAction = `Qi(xe.Button,{className:\`${'${Eo}'}__action ${'${Eo}'}__add\`,onClick:()=>{o(i+1),h()},children:[Ir(lr,{}),f("general:addBelow")]})`
const invalidPatchedAddRowAction = `Qi(S$.Fragment,{children:${addRowAction}})`
const arrayActionOriginal = `!s&&Qi(S$.Fragment,{children:[Qi(xe.Button,{className:\`${'${Eo}'}__action ${'${Eo}'}__add\`,onClick:()=>{o(i+1),h()},children:[Ir(lr,{}),f("general:addBelow")]}),Qi(xe.Button,{className:\`${'${Eo}'}__action ${'${Eo}'}__duplicate\`,onClick:()=>{r(i),h()},children:[Ir(Bi,{}),f("general:duplicate")]})]})`
const arrayActionReplacement = `!s&&${addRowAction},Qi(xe.Button,{className:\`${'${Eo}'}__action ${'${Eo}'}__cut\`,onClick:()=>{n(i,!0),h()},${cutIconReplacement}})`

const blocksRowCopyOriginal = `ye=Mn(ae=>{let he=sl({type:s,blocks:De,getDataToCopy:()=>cl({formState:{...R()},path:ee,rowIndex:ae}),path:ee,rowIndex:ae,t:o});typeof he=="string"?J.error(he):J.success(o("general:copied"))},[De,ee,o,s,R])`
const blocksRowCopyReplacement = `ye=Mn((ae,he=!1)=>{let be=sl({type:s,blocks:De,getDataToCopy:()=>cl({formState:{...R()},path:ee,rowIndex:ae}),cut:he,path:ee,rowIndex:ae,t:o});typeof be=="string"?J.error(be):J.success(o("general:copied"))},[De,ee,o,s,R])`

const arrayRowCopyOriginal = `Ee=Fn(q=>{let ve={...F()},ae=sl({type:n,fields:l,getDataToCopy:()=>cl({formState:ve,path:Y,rowIndex:q}),path:Y,rowIndex:q,t:P});typeof ae=="string"?J.error(ae):J.success(P("general:copied"))},[l,F,Y,P,n])`
const arrayRowCopyReplacement = `Ee=Fn((q,ve=!1)=>{let ae={...F()},he=sl({type:n,fields:l,getDataToCopy:()=>cl({formState:ae,path:Y,rowIndex:q}),cut:ve,path:Y,rowIndex:q,t:P});typeof he=="string"?J.error(he):J.success(P("general:copied"))},[l,F,Y,P,n])`

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
clientBundle = replaceExactBundleText({
  alreadyPatchedMarker: 'r.cut===!0',
  expectedOriginal: clipboardPasteOriginal,
  replacement: clipboardPasteReplacement,
  source: clientBundle,
})
clientBundle = replaceBundleSegment({
  alreadyPatchedMarker: 't.cut===!0&&A>=0',
  endMarker: 'import{c as U9}',
  expectedOriginalMarkerGroups: [
    ['u=!a&&c,d=r==="array",f;', 'e[o].initialValue=1', 'typeof y=="string"&&T2.isValid(y)'],
    [
      'f=Array.isArray(e[o]?.rows)?e[o].rows:[]',
      'e[o].rows=[...f,v]',
      'C.endsWith(".id")&&s[C]?.value!=null',
    ],
  ],
  replacement: clipboardMergeReplacement,
  source: clientBundle,
  startMarker: 'function ul(',
})
clientBundle = replaceExactBundleText({
  alreadyPatchedMarker: '"Wytnij wiersz"',
  expectedOriginal: arrayActionOriginal,
  replacement: arrayActionReplacement,
  source: clientBundle,
})
clientBundle = replaceExactBundleText({
  alreadyPatchedMarker: `!s&&${addRowAction}`,
  expectedOriginal: `!s&&${invalidPatchedAddRowAction}`,
  replacement: `!s&&${addRowAction}`,
  source: clientBundle,
})
clientBundle = replaceExactBundleText({
  alreadyPatchedMarker: 'icon--scissors',
  expectedOriginal: cutIconOriginal,
  replacement: cutIconReplacement,
  source: clientBundle,
})
clientBundle = replaceExactBundleText({
  alreadyPatchedMarker:
    'type:s,blocks:De,getDataToCopy:()=>cl({formState:{...R()},path:ee,rowIndex:ae}),cut:he',
  expectedOriginal: blocksRowCopyOriginal,
  replacement: blocksRowCopyReplacement,
  source: clientBundle,
})
clientBundle = replaceExactBundleText({
  alreadyPatchedMarker:
    'type:n,fields:l,getDataToCopy:()=>cl({formState:ae,path:Y,rowIndex:q}),cut:ve',
  expectedOriginal: arrayRowCopyOriginal,
  replacement: arrayRowCopyReplacement,
  source: clientBundle,
})

if (clientBundle !== originalClientBundle) {
  writeFileSync(clientBundlePath, clientBundle)
}

function replaceBundleSegment({
  alreadyPatchedMarker,
  endMarker,
  expectedOriginalMarkers,
  expectedOriginalMarkerGroups,
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

  const markerGroups = expectedOriginalMarkerGroups ?? [expectedOriginalMarkers]
  const matchesExpectedSource = markerGroups.some((markerGroup) =>
    markerGroup.every((expectedMarker) => currentSegment.includes(expectedMarker)),
  )
  if (!matchesExpectedSource) {
    throw new Error(`Payload bundle segment ${startMarker} no longer matches version 3.90.2`)
  }

  return source.slice(0, startIndex) + replacement + source.slice(endIndex)
}

function replaceExactBundleText({ alreadyPatchedMarker, expectedOriginal, replacement, source }) {
  if (source.includes(alreadyPatchedMarker)) {
    return source
  }

  const firstIndex = source.indexOf(expectedOriginal)
  if (firstIndex < 0 || source.indexOf(expectedOriginal, firstIndex + 1) >= 0) {
    throw new Error('Cannot locate the unique Payload bundle text to patch')
  }

  return (
    source.slice(0, firstIndex) + replacement + source.slice(firstIndex + expectedOriginal.length)
  )
}

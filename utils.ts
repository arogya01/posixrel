

export const findStringWithSubstr = (substr: string, validCommands: string[]) => {
    return validCommands.find(str=> str.includes(substr)); 
}
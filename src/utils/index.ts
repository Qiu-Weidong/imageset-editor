


function exception2string(excp: any): string {
  if (excp.errorText) {
    return excp.errorText;
  }
  return JSON.stringify(excp)
}

export {
  exception2string,
}




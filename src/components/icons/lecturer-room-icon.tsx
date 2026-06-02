import * as React from "react"

type IconProps = React.SVGProps<SVGSVGElement>

export function LecturerRoomIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || ''}
      aria-hidden="true"
      {...props}
    >
      <path d="M11.75 20.75H3.75C1.75 20.75 0.75 19.75 0.75 17.75V9.75C0.75 7.75 1.75 6.75 3.75 6.75H8.75V17.75C8.75 19.75 9.75 20.75 11.75 20.75Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.86 2.75C8.78 3.05 8.75 3.38 8.75 3.75V6.75H3.75V4.75C3.75 3.65 4.65 2.75 5.75 2.75H8.86Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.75 6.75V11.75" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.75 6.75V11.75" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.75 15.75H13.75C13.2 15.75 12.75 16.2 12.75 16.75V20.75H16.75V16.75C16.75 16.2 16.3 15.75 15.75 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.75 11.75V15.75" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.75 17.75V3.75C8.75 1.75 9.75 0.75 11.75 0.75H17.75C19.75 0.75 20.75 1.75 20.75 3.75V17.75C20.75 19.75 19.75 20.75 17.75 20.75H11.75C9.75 20.75 8.75 19.75 8.75 17.75Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

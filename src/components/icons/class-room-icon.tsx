import * as React from "react"

type IconProps = React.SVGProps<SVGSVGElement>

export function ClassRoomIcon({ className, ...props }: IconProps) {
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
      <path d="M0.75 20.75H20.75" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.75 8.39221C1.75 7.76563 2.04 7.16991 2.52 6.77958L9.52 1.18142C10.24 0.606194 11.25 0.606194 11.98 1.18142L18.98 6.7693C19.47 7.15963 19.75 7.75536 19.75 8.39221V20.7493" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.7002 20.7492L1.7302 12.5625" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.25 9.45117H7.25C6.42 9.45117 5.75 10.1394 5.75 10.9919V20.7502H15.75V10.9919C15.75 10.1394 15.08 9.45117 14.25 9.45117Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.75 14.8438V16.3845" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.25 5.85547H12.25" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

import React, { FC } from 'react'

interface IProps {
  className?: string
}

export const CircleIcon: FC<IProps> = ({ className }) => {
  return (
    <svg aria-hidden="true" className={className} fill="none" height="75" viewBox="0 0 75 75" width="75">
      <path
        d="M74 37.5C74 30.281 71.8593 23.2241 67.8486 17.2217C63.838 11.2193 58.1375 6.541 51.4679 3.7784C44.7984 1.0158 37.4595 0.292977 30.3792 1.70134C23.2989 3.1097 16.7952 6.58599 11.6906 11.6906C6.58599 16.7952 3.1097 23.2989 1.70134 30.3792C0.292977 37.4595 1.0158 44.7984 3.7784 51.4679C6.541 58.1375 11.2193 63.838 17.2217 67.8486C23.2241 71.8593 30.281 74 37.5 74"
        opacity="1"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeDasharray="2 2"
      ></path>
      <defs>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform="translate(37.5 37.5) rotate(90) scale(36.5)"
          gradientUnits="userSpaceOnUse"
          id="paint0_angular_25_2122"
          r="1"
        >
          <stop></stop>
          <stop offset="0.5" stopOpacity="0.34"></stop>
          <stop offset="1"></stop>
        </radialGradient>
      </defs>
    </svg>
  )
}

export const ReactIcon: FC<IProps> = ({ className }) => {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="#61DAFB" xmlns="http://www.w3.org/2000/svg" className={className}>
      <title>React</title>
      <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
    </svg>
  )
}

export const JavascriptIcon: FC<IProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-label="JavaScript"
      role="img"
      viewBox="0 0 512 512"
      fill="#000000"
      stroke="#000000"
      className={className}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <rect width="512" height="512" rx="15%" fill="#f7df1e"></rect>
        <path d="M324 370c10 17 24 29 47 29c20 0 33-10 33 -24c0-16 -13 -22 -35 -32l-12-5c-35-15 -58 -33 -58 -72c0-36 27 -64 70 -64c31 0 53 11 68 39l-37 24c-8-15 -17 -21 -31 -21c-14 0-23 9 -23 21c0 14 9 20 30 29l12 5c41 18 64 35 64 76c0 43-34 67 -80 67c-45 0-74 -21 -88 -49zm-170 4c8 13 14 25 31 25c16 0 26-6 26 -30V203h48v164c0 50-29 72 -72 72c-39 0-61 -20 -72 -44z"></path>
      </g>
    </svg>
  )
}

export const ArrowRightIcon: FC<IProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 8L22 12L18 16" />
      <path d="M2 12H22" />
    </svg>
  )
}

export const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} fill="currentColor">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12.3584 9.38246C11.3857 9.78702 9.4418 10.6244 6.5266 11.8945C6.05321 12.0827 5.80524 12.2669 5.78266 12.4469C5.74451 12.7513 6.12561 12.8711 6.64458 13.0343C6.71517 13.0565 6.78832 13.0795 6.8633 13.1039C7.37388 13.2698 8.06071 13.464 8.41776 13.4717C8.74164 13.4787 9.10313 13.3452 9.50222 13.0711C12.226 11.2325 13.632 10.3032 13.7203 10.2832C13.7826 10.269 13.8689 10.2513 13.9273 10.3032C13.9858 10.3552 13.98 10.4536 13.9739 10.48C13.9361 10.641 12.4401 12.0318 11.666 12.7515C11.4351 12.9661 11.2101 13.1853 10.9833 13.4039C10.509 13.8611 10.1533 14.204 11.003 14.764C11.8644 15.3317 12.7323 15.8982 13.5724 16.4971C13.9867 16.7925 14.359 17.0579 14.8188 17.0156C15.0861 16.991 15.3621 16.7397 15.5022 15.9903C15.8335 14.2193 16.4847 10.3821 16.6352 8.80083C16.6484 8.6623 16.6318 8.485 16.6185 8.40717C16.6052 8.32934 16.5773 8.21844 16.4762 8.13635C16.3563 8.03913 16.1714 8.01863 16.0887 8.02009C15.7125 8.02672 15.1355 8.22737 12.3584 9.38246Z"></path>
  </svg>
)

export const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} fill="currentColor">
    <path d="M18.3362 18.339H15.6707V14.1622C15.6707 13.1662 15.6505 11.8845 14.2817 11.8845C12.892 11.8845 12.6797 12.9683 12.6797 14.0887V18.339H10.0142V9.75H12.5747V10.9207H12.6092C12.967 10.2457 13.837 9.53325 15.1367 9.53325C17.8375 9.53325 18.337 11.3108 18.337 13.6245V18.339H18.3362ZM7.00373 8.57475C6.14573 8.57475 5.45648 7.88025 5.45648 7.026C5.45648 6.1725 6.14648 5.47875 7.00373 5.47875C7.85873 5.47875 8.55173 6.1725 8.55173 7.026C8.55173 7.88025 7.85798 8.57475 7.00373 8.57475ZM8.34023 18.339H5.66723V9.75H8.34023V18.339ZM19.6697 3H4.32923C3.59498 3 3.00098 3.5805 3.00098 4.29675V19.7033C3.00098 20.4202 3.59498 21 4.32923 21H19.6675C20.401 21 21.001 20.4202 21.001 19.7033V4.29675C21.001 3.5805 20.401 3 19.6675 3H19.6697Z"></path>
  </svg>
)

export const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} fill="currentColor">
    <path d="M10.4883 14.651L15.25 21H22.25L14.3917 10.5223L20.9308 3H18.2808L13.1643 8.88578L8.75 3H1.75L9.26086 13.0145L2.31915 21H4.96917L10.4883 14.651ZM16.25 19L5.75 5H7.75L18.25 19H16.25Z"></path>
  </svg>
)

export const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} fill="currentColor">
    <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 7.23792L12.0718 14.338L4 7.21594V19H20V7.23792ZM4.51146 5L12.0619 11.662L19.501 5H4.51146Z"></path>
  </svg>
)

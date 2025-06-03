import { SVGProps } from "react";

export const KeySVG = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_640_2414)">
      <path
        d="M4.14094 13.2241C4.89383 13.2241 5.50417 12.6141 5.50417 11.8617C5.50417 11.1093 4.89383 10.4994 4.14094 10.4994C3.38805 10.4994 2.77771 11.1093 2.77771 11.8617C2.77771 12.6141 3.38805 13.2241 4.14094 13.2241Z"
        stroke={props.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.29657 8.58388L11.8898 5.98209L11.9103 4.86557L13.1095 4.77338L13.3043 3.48273L14.5752 3.30859L15.4977 2.3867L15.2825 0.727285L13.622 0.512177L7.42085 6.70936C5.64762 5.74649 3.38241 5.99233 1.88593 7.49809C0.0614603 9.33164 0.0614603 12.2919 1.88593 14.1152C3.7104 15.9386 6.68286 15.9386 8.50733 14.1152C10.0038 12.6095 10.2601 10.356 9.28632 8.58388H9.29657Z"
        stroke={props.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_640_2414">
        <rect width={16} height={16} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

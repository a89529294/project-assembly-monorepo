import { SVGProps } from "react";

export const BuildingSVG = (props: SVGProps<SVGSVGElement>) => {
  console.log(props);
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_640_1770)">
        <path
          d="M8.39 0.5H0.5V13.11H8.39V0.5Z"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.16 13.11H8.39001V5.47L13.16 7.47V13.11Z"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.76 10.58H3.37V13.11H5.76V10.58Z"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.47998 3.21V2.63"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.41003 3.21V2.63"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.37 3.21V2.63"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 5.53V4.95"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.43005 5.53V4.95"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.39001 5.53V4.95"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 7.78V7.2"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.43005 7.78V7.2"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.39001 7.78V7.2"
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_640_1770">
          <rect width={13.66} height={13.61} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

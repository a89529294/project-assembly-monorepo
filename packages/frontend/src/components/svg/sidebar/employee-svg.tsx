import { SVGProps } from "react";

export const EmployeeSVG = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_640_2426)">
      <path
        d="M3.41668 14.5202C2.85186 14.5202 2.40742 14.0019 2.47223 13.4165L2.64816 11.8042C2.77779 10.2111 3.75001 9.21305 5.1852 8.69482C5.55557 8.56046 6.72223 8.33973 6.78705 7.4952C6.81483 7.10173 6.66668 6.72745 6.35186 6.49712C5.57408 5.9309 4.98149 5.08637 4.87964 4.10749C4.62038 1.80422 6.72223 -0.105566 9.00927 0.642995C9.87964 0.930903 10.6111 1.64108 10.9259 2.53359C11.4722 4.0787 10.9074 5.67179 9.67594 6.48752C9.3426 6.70825 9.14816 7.10173 9.20371 7.5048C9.32409 8.4261 10.4445 8.56046 10.8148 8.70441C12.2408 9.23225 13.213 10.2303 13.3426 11.8138L13.5278 13.4165C13.5926 14.0019 13.1574 14.5202 12.5833 14.5202H3.41668Z"
        stroke={props.stroke}
        strokeMiterlimit={10}
      />
      <path
        d="M6.54626 8.07101L7.99997 9.08829L9.44441 8.07101"
        stroke={props.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10.7678V12.572"
        stroke={props.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_640_2426">
        <rect width={12} height={15} fill="white" transform="translate(2)" />
      </clipPath>
    </defs>
  </svg>
);

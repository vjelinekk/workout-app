import * as React from 'react';

export function Spinner({
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    className,
    ...props
}: React.SVGProps<SVGSVGElement> & {
    size?: number;
    color?: string;
    strokeWidth?: number;
}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <circle cx="12" cy="3" r="0">
                <animate
                    id="SVG4G6AvsmK"
                    attributeName="r"
                    begin="0;SVGvWIhNcAr.end-0.5s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="16.5" cy="4.21" r="0">
                <animate
                    id="SVGeE4wqdhI"
                    attributeName="r"
                    begin="SVG4G6AvsmK.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="7.5" cy="4.21" r="0">
                <animate
                    id="SVGvWIhNcAr"
                    attributeName="r"
                    begin="SVG7bFLwcpj.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="19.79" cy="7.5" r="0">
                <animate
                    id="SVGEevPNd9f"
                    attributeName="r"
                    begin="SVGeE4wqdhI.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="4.21" cy="7.5" r="0">
                <animate
                    id="SVG7bFLwcpj"
                    attributeName="r"
                    begin="SVGQTNUCd1M.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="21" cy="12" r="0">
                <animate
                    id="SVGuBK1DdeV"
                    attributeName="r"
                    begin="SVGEevPNd9f.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="3" cy="12" r="0">
                <animate
                    id="SVGQTNUCd1M"
                    attributeName="r"
                    begin="SVGGpgq51kq.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="19.79" cy="16.5" r="0">
                <animate
                    id="SVG0SGXodLb"
                    attributeName="r"
                    begin="SVGuBK1DdeV.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="4.21" cy="16.5" r="0">
                <animate
                    id="SVGGpgq51kq"
                    attributeName="r"
                    begin="SVGlDB0aenh.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="16.5" cy="19.79" r="0">
                <animate
                    id="SVGjNSy9c1D"
                    attributeName="r"
                    begin="SVG0SGXodLb.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="7.5" cy="19.79" r="0">
                <animate
                    id="SVGlDB0aenh"
                    attributeName="r"
                    begin="SVGq7gqkb6a.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
            <circle cx="12" cy="21" r="0">
                <animate
                    id="SVGq7gqkb6a"
                    attributeName="r"
                    begin="SVGjNSy9c1D.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines="0,1,0,1;.53,0,.61,.73"
                    keyTimes="0;.2;1"
                    values="0;2;0"
                />
            </circle>
        </svg>
    );
}

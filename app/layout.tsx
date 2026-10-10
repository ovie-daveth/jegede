import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Micheal Jegede | Mechanical Engineer & CAD Designer',description:'Engineering portfolio of Micheal Oluwatobi Jegede. AutoCAD drafting, 3D modelling and mechanical engineering projects.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

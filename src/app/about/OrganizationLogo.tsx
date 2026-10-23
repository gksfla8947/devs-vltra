import Image from "next/image";
import styles from "./about.module.css";

const organizations = {
  kookmin: { name: "국민대학교", src: "/organizations/kookmin.png" },
  autocrypt: { name: "아우토크립트", src: "/organizations/autocrypt.png" },
  wins: { name: "윈스", src: "/organizations/wins.png" },
};

export default function OrganizationLogo({ organization }: { organization: keyof typeof organizations }) {
  const logo = organizations[organization];
  return <span className={`${styles.organizationLogo} ${styles[organization]}`}>
    <Image src={logo.src} alt={`${logo.name} 로고`} width={64} height={64} />
  </span>;
}

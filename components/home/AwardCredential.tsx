import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import type { SignatureVilla } from "@/lib/lodgify/types";
import styles from "./AwardCredential.module.css";

type AwardCredentialProps = {
  award: NonNullable<SignatureVilla["award"]>;
};

export default function AwardCredential({ award }: AwardCredentialProps) {
  const content = (
    <>
      {award.logo ? (
        <div className={styles.mark} aria-hidden="true">
          <Image src={award.logo} alt="" fill sizes="48px" />
        </div>
      ) : null}
      <div className={styles.copy}>
        <strong>{award.name}</strong>
        {award.issuer || award.year ? (
          <small>{[award.issuer, award.year].filter(Boolean).join(" · ")}</small>
        ) : null}
      </div>
      {award.url ? <FiArrowUpRight className={styles.external} aria-hidden="true" /> : null}
    </>
  );

  if (award.url) {
    return (
      <Link
        className={styles.credential}
        href={award.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Verify ${award.name}`}
      >
        {content}
      </Link>
    );
  }

  return <div className={styles.credential}>{content}</div>;
}

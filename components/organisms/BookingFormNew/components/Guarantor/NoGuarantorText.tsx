import styles from './styles.module.scss'

export const NoGuarantorText = () => {
  return (
    <aside className={styles.wrapper}>
      <p className={styles.headingSmall}>
        No guarantor? You still have options.
      </p>

      <p className={styles.paragraph}>
        You can use a guarantor service instead. These services act as your
        guarantor for a monthly fee.
      </p>

      <p className={styles.paragraph}>
        We recommend Housing Hand, a trusted guarantor service. After you submit
        your booking request, we’ll email you the next steps.
      </p>
    </aside>
  )
}

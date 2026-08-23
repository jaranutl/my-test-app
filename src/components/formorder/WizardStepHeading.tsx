type WizardStepHeadingProps = {
  icon: React.ReactNode;
  title: string;
  note: string;
};

export const WizardStepHeading = ({ icon, title, note }: WizardStepHeadingProps) => (
  <div className="mb-6 text-center">
    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#d34f77] dark:bg-rose-400/15 dark:text-rose-300 [&>svg]:size-6">
      {icon}
    </span>
    <h2 className="mt-4 text-xl font-semibold text-stone-800 dark:text-stone-100">{title}</h2>
    <p className="mt-1 text-sm text-stone-400">{note}</p>
  </div>
);

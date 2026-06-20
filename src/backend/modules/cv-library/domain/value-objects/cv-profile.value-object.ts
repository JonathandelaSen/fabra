import { LongText, StringList, ValueObject } from "@/backend/modules/shared";
import {
  normalizeStandardCVProfile,
  type StandardCVProfilePrimitives,
} from "../cv-profile";
import { CVBasics } from "./cv-basics.value-object";
import { CVEducation } from "./cv-education.value-object";
import { CVExperience } from "./cv-experience.value-object";
import { CVLanguage } from "./cv-language.value-object";
import { CVNamedItem } from "./cv-named-item.value-object";
import { CVPresentation } from "./cv-presentation.value-object";
import { CVSkillGroup } from "./cv-skill-group.value-object";

export class CVProfile extends ValueObject<StandardCVProfilePrimitives> {
  private constructor(
    private readonly basics: CVBasics,
    private readonly experience: CVExperience[],
    private readonly education: CVEducation[],
    private readonly skills: CVSkillGroup[],
    private readonly languages: CVLanguage[],
    private readonly certifications: CVNamedItem[],
    private readonly projects: CVNamedItem[],
    private readonly awards: CVNamedItem[],
    private readonly publications: CVNamedItem[],
    private readonly volunteering: CVNamedItem[],
    private readonly technicalSkills: StringList,
    private readonly summary?: LongText,
    private readonly presentation?: CVPresentation,
  ) {
    super();
  }

  static fromPrimitives(raw: StandardCVProfilePrimitives): CVProfile {
    const profile = normalizeStandardCVProfile(raw);
    const named = (items: typeof profile.certifications) =>
      (items ?? []).map((item) => CVNamedItem.fromPrimitives(item));
    return new CVProfile(
      CVBasics.fromPrimitives(profile.basics ?? {}),
      (profile.experience ?? []).map((item) => CVExperience.fromPrimitives(item)),
      (profile.education ?? []).map((item) => CVEducation.fromPrimitives(item)),
      (profile.skills ?? []).map((item) => CVSkillGroup.fromPrimitives(item)),
      (profile.languages ?? []).map((item) => CVLanguage.fromPrimitives(item)),
      named(profile.certifications),
      named(profile.projects),
      named(profile.awards),
      named(profile.publications),
      named(profile.volunteering),
      StringList.fromPrimitives(profile.technicalSkills ?? []),
      profile.summary === undefined
        ? undefined
        : LongText.fromPrimitives(profile.summary),
      profile.presentation === undefined
        ? undefined
        : CVPresentation.fromPrimitives(profile.presentation),
    );
  }

  toPrimitives(): StandardCVProfilePrimitives {
    return {
      basics: this.basics.toPrimitives(),
      summary: this.summary?.toPrimitives(),
      experience: this.experience.map((item) => item.toPrimitives()),
      education: this.education.map((item) => item.toPrimitives()),
      skills: this.skills.map((item) => item.toPrimitives()),
      languages: this.languages.map((item) => item.toPrimitives()),
      certifications: this.certifications.map((item) => item.toPrimitives()),
      projects: this.projects.map((item) => item.toPrimitives()),
      awards: this.awards.map((item) => item.toPrimitives()),
      publications: this.publications.map((item) => item.toPrimitives()),
      technicalSkills: this.technicalSkills.toPrimitives(),
      volunteering: this.volunteering.map((item) => item.toPrimitives()),
      presentation: this.presentation?.toPrimitives(),
    };
  }
}

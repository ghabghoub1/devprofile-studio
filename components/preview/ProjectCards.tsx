import { parseProjects } from "../../lib/profile";

type ProjectCardsProps = {
  projects: string;
};

export default function ProjectCards({ projects }: ProjectCardsProps) {
  return (
    <div className="projects">
      {parseProjects(projects).map((project, index) => (
        <div className="project" key={index}>
          <strong>{project.name}</strong>
          {project.description && <p>{project.description}</p>}
        </div>
      ))}
    </div>
  );
}

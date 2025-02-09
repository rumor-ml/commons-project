// Imports injected by component.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultColor } from 'util';
import _ from 'lodash';

interface Meta {
  path: string;
  sha: string;
}

interface Project {
  name: string;
  components: Meta[];
}

interface Solution {
  name: string;
  projects: Project[];
}

const Component = ({ storage }: Props) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);

  useEffect(() => {

    const init = async () => {
      const meta = await storage.listMeta({ allsolutions: true });
      const solutionMap = new Map<string, Map<string, Meta[]>>();
      
      meta.forEach((item: Meta) => {
        const parsed = parsePath(item.path);
        if (!parsed) {
          console.warn("parsePath; !parsed", item.path)
          return;
        }
        
        if (!solutionMap.has(parsed.solution)) {
          solutionMap.set(parsed.solution, new Map());
        }
        
        const projectMap = solutionMap.get(parsed.solution)!;
        if (!projectMap.has(parsed.project)) {
          projectMap.set(parsed.project, []);
        }
        
        projectMap.get(parsed.project)!.push(item);
      });

      const solutionsArray = Array.from(solutionMap.entries()).map(([solutionName, projectMap]) => ({
        name: solutionName,
        projects: Array.from(projectMap.entries()).map(([projectName, components]) => ({
          name: projectName,
          components
        }))
      }));

      setSolutions(solutionsArray);
    };

    init().catch(error => {
      console.error('Failed to initialize component', error);
    });
  }, [storage]);

  if (solutions.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table of Contents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {solutions.map((solution) => (
            <div key={solution.name} className="space-y-2">
              <h2 className="text-xl font-bold">
                <a 
                  href={`/solution/${solution.name}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {solution.name}
                </a>
              </h2>
              <div className="pl-4 space-y-1">
                {solution.projects.map((project) => (
                  <div key={project.name}>
                    <a 
                      href={`/${solution.name}/${project.name}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {project.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const parsePath = (path: string) => {
  const parts = path.split('/');
  if (parts.length >= 3) {
    return {
      solution: parts[0],
      project: parts[1],
      component: parts[2]
    };
  }
  return null;
};

export default Component;

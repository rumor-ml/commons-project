// Imports injected by component.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultColor } from 'util';
import _ from 'lodash';

const key = "toc"

interface ComponentModel {
  Key: string;
}

interface ProjectModel {
  Name: string;
  Component: ComponentModel[];
}

interface SolutionModel {
  Name: string;
  Project: ProjectModel[];
}

interface TocModel {
  Solution: SolutionModel[];
}

const Component = ({ storage }: Props) => {
  const [data, setData] = useState<TocModel | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      const { cleanup } = await storage.syncComponent({
        `component/${key}.json`: setData,
      });
      return cleanup;
    };

    init().catch(error => {
      console.error('Failed to initialize component', key, error);
    });
  }, [storage]);

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table of Contents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.Solution.map((solution) => (
            <div key={solution.Name} className="space-y-2">
              <h2 className="text-xl font-bold">
                <a 
                  href={`/solution/${solution.Name}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {solution.Name}
                </a>
              </h2>
              <div className="pl-4 space-y-1">
                {solution.Project.map((project) => (
                  <div key={project.Name}>
                    <a 
                      href={`/${solution.Name}/${project.Name}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {project.Name}
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

export default Component;

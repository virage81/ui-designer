import type { History, Layer, Project } from '@shared/types/project';

export type CreateProjectParams = {} & Omit<Project, 'id' | 'preview' | 'date'>;

export type UpdateProjectParams = { id: Project['id'] } & Partial<Omit<Project, 'id'>>;

export type DeleteProjectParams = { id: Project['id'] };

export type CreateLayerParams = {
	projectId: Project['id'];
	data: Omit<Layer, 'id' | 'isBase'>;
};

export type UpdateLayerParams = {
	projectId: Project['id'];
	data: { id: Layer['id'] } & Partial<Omit<Layer, 'id'>>;
};

export type DeleteLayerParams = {
	id: Layer['id'];
	projectId: Project['id'];
};

export type SetActiveLayerParams = {
	id: Layer['id'];
	projectId: Project['id'];
} | null;

export type ClearActiveLayer = {
	layerId: Layer['id'];
	projectId: Project['id'];
} | null;

export type ModifyHistoryParams = {
	projectId: Project['id'];
	data: Omit<History, 'id'>;
};

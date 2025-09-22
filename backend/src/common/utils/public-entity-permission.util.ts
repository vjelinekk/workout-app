import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { RoleEnum } from "src/modules/user/enums/role.enum";
import { FindAllScopes } from "../enums/find-all-scopes.enum";

export interface PublicAuthorizableEntity {
    id: number;
    createdById: number;
    isPublic: boolean;
    isApproved: boolean;
}

export class PublicEntityPermissionUtil {
    /**
     * Checks if the user has admin privileges.
     * 
     * @param userRoles Array of roles the user has
     * @returns True if the user is an admin, false otherwise
     */
    static isAdmin(userRoles: RoleEnum[]): boolean {
        return userRoles.includes(RoleEnum.ADMIN);
    }

    /**
     * Validates if a user has permission to modify a public entity.
     * 
     * @param entity An entity to check ownership of
     * @param userId ID of the user to check ownership against
     * @returns True if the user is the owner of the entity, false otherwise
     */
    static isOwner<T extends PublicAuthorizableEntity>(entity: T, userId: number): boolean {
        return entity.createdById === userId;
    }

    static validateModificationPermission<T extends PublicAuthorizableEntity>(
        entity: T,
        userId: number,
        userRoles: RoleEnum[],
        action: 'update' | 'delete' | 'restore',
        entityName: string,
    ): void {
        if (entity.isPublic && entity.isApproved) {
            throw new ForbiddenException(
                `Cannot ${action} ${entityName} that is publicly visible to other users`,
            );
        }

        if (!this.isOwner(entity, userId) && !this.isAdmin(userRoles)) {
            throw new UnauthorizedException(
                `Only the owner or an admin can ${action} this ${entityName}.`,
            );
        }
    }

    static validateEntityAccess<T extends PublicAuthorizableEntity>(
        userRoles: RoleEnum[],
        scope: FindAllScopes,
        entityName: string,
    ) {
        const isAdmin = this.isAdmin(userRoles);

        if (!isAdmin && scope === FindAllScopes.ALL) {
            throw new UnauthorizedException(
                `Only admins can access all ${entityName}.`,
            );
        }
    }
}